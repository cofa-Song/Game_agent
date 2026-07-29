/**
 * useAgentTree.ts
 * SAL-302 / SAL-303 核心業務邏輯 Composable
 *
 * 提供：
 *  - 無限層代理樹狀結構組裝
 *  - Bottom-Up CPA 分潤計算（50% / 25% / 25% / 0%）
 *  - 遞迴儲值抽成有效成數計算
 */

export interface AgentNode {
  uid: string
  account: string
  realName: string
  accountType: string
  parentUid: string | null
  depth: number
  status: 'normal' | 'frozen' | 'disabled'
  cpaEnabled?: boolean
  baseCpa?: number
  commissionAllocationRate: number // 上級給此代理的分配率 0~100
  [key: string]: any
}

export interface TreeNode extends AgentNode {
  children: TreeNode[]
}

// ─────────────────────────────────────────────
// 1. 建立樹狀結構（扁平列表 → 巢狀樹）
// ─────────────────────────────────────────────
export function buildTree(flatList: AgentNode[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  flatList.forEach(agent => {
    nodeMap.set(agent.uid, { ...agent, children: [] })
  })

  flatList.forEach(agent => {
    const node = nodeMap.get(agent.uid)!
    if (agent.parentUid === null) {
      roots.push(node)
    } else {
      const parent = nodeMap.get(agent.parentUid)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  return roots
}

// ─────────────────────────────────────────────
// 2. 向上追溯祖先鏈（CPA 分潤用）
//    回傳從直屬代理(A0)到根節點(An)的順序陣列
// ─────────────────────────────────────────────
export function getAncestors(uid: string, flatList: AgentNode[]): AgentNode[] {
  const nodeMap = new Map<string, AgentNode>()
  flatList.forEach(a => nodeMap.set(a.uid, a))

  const chain: AgentNode[] = []
  let current = nodeMap.get(uid)
  while (current) {
    chain.push(current)
    if (current.parentUid === null) break
    current = nodeMap.get(current.parentUid)
  }
  return chain // chain[0] = A0(直屬代理), chain[1] = A1, chain[2] = A2, ...
}

// ─────────────────────────────────────────────
// 3. SAL-302: Bottom-Up CPA 分潤計算
//    規則：A0=50%, A1=25%, A2=25%, A3+=0%
//    若中間代理停用 → 該份額截留平台（不遞補）
// ─────────────────────────────────────────────
export interface CpaDistributionItem {
  uid: string
  account: string
  realName: string
  depth: number        // 0=A0, 1=A1, 2=A2
  ratio: number        // 分潤比例（0~100）
  amount: number       // 實際金額
  status: string
  retained: boolean    // true = 停用截留
}

export function computeCpaDistribution(
  baseCpa: number,
  chain: AgentNode[]  // chain[0]=A0, chain[1]=A1, chain[2]=A2, ...
): CpaDistributionItem[] {
  // 固定比例：依鏈長決定分配
  const getRatio = (depth: number, chainLength: number): number => {
    if (chainLength === 1) return depth === 0 ? 100 : 0
    if (chainLength === 2) return depth === 0 ? 50 : depth === 1 ? 50 : 0
    // 3層以上：A0=50, A1=25, A2=25, A3+=0
    if (depth === 0) return 50
    if (depth === 1) return 25
    if (depth === 2) return 25
    return 0
  }

  return chain.map((agent, idx) => {
    const ratio = getRatio(idx, chain.length)
    const amount = Math.floor(baseCpa * ratio / 100)
    const retained = agent.status === 'disabled' && ratio > 0

    return {
      uid: agent.uid,
      account: agent.account,
      realName: agent.realName,
      depth: idx,
      ratio,
      amount: retained ? 0 : amount,
      status: agent.status,
      retained
    }
  })
}

// ─────────────────────────────────────────────
// 4. SAL-303: 遞迴儲值抽成有效成數計算
//    En = En-1 × Pn/100
//    Marginn = En × (1 - Pn+1/100)
//    前端只傳遞相對分配率，不洩漏平台原始 Rplatform
// ─────────────────────────────────────────────
export interface CommissionChainItem {
  uid: string
  account: string
  realName: string
  allocationRate: number    // 上級給他的分配率（相對值，0~100）
  effectiveRate: number     // 換算平台絕對成數（%，需知 Rplatform）
  marginRate: number        // 自身留存利潤率（%，絕對值）
  actualAmount: number      // 以指定儲值金額試算的實拿金額
}

export function computeCommissionChain(
  chain: AgentNode[],        // chain[0]=根節點(A0), chain[1]=A1, ...
  rPlatform: number,         // 平台原始抽成比例（%），例如 20
  depositAmount: number      // 試算儲值金額
): CommissionChainItem[] {
  const result: CommissionChainItem[] = []
  let effectiveRate = rPlatform

  for (let i = 0; i < chain.length; i++) {
    const agent = chain[i]
    const allocationRate = i === 0 ? 100 : agent.commissionAllocationRate
    const selfEffective = i === 0 ? rPlatform : effectiveRate

    const nextAllocation = i < chain.length - 1
      ? chain[i + 1].commissionAllocationRate
      : 0

    const marginRate = selfEffective * (1 - nextAllocation / 100)
    const actualAmount = Math.round(depositAmount * marginRate / 100)

    result.push({
      uid: agent.uid,
      account: agent.account,
      realName: agent.realName,
      allocationRate,
      effectiveRate: selfEffective,
      marginRate,
      actualAmount
    })

    // 下一層的有效成數 = 本層有效成數 × 分配給下線的比例
    if (i < chain.length - 1) {
      effectiveRate = selfEffective * (chain[i + 1].commissionAllocationRate / 100)
    }
  }

  return result
}

// ─────────────────────────────────────────────
// 5. 取得代理在樹中的深度標籤
// ─────────────────────────────────────────────
export function getDepthLabel(depth: number): string {
  if (depth === 0) return '總代理'
  if (depth === 1) return '一級代理'
  if (depth === 2) return '二級代理'
  return `${depth}級代理`
}
