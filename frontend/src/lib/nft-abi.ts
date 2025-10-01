// ABI for MockMocaNFT contract - only the functions we need
export const mockMocaNftAbi = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'hasEligibleNFT',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

