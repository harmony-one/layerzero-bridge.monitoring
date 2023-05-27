import * as process from 'process';

export default () => ({
  hmy: {
    name: 'hmy',
    url: process.env.HMY_NODE_URL,
    contract: process.env.HMY_LZ_CONTRACT || "0x9740FF91F1985D8d2B71494aE1A2f723bb3Ed9E4",
    lzEndpointContract: process.env.HMY_LZ_ENDPOINT || "0x9740FF91F1985D8d2B71494aE1A2f723bb3Ed9E4",
    multisigContract: process.env.HMY_MULTISIG || "0x0c1310bbd93c6977fde20dc813cff8236ba1f0dd"
  },
  bsc: {
    name: 'bsc',
    url: process.env.BSC_NODE_URL,
    contract: process.env.BSC_LZ_CONTRACT || "0x4D73AdB72bC3DD368966edD0f0b2148401A178E2",
    lzEndpointContract: process.env.BSC_LZ_ENDPOINT || "0x3c2269811836af69497E5F486A85D7316753cf62",
    multisigContract: process.env.BSC_MULTISIG || "0x715CdDa5e9Ad30A0cEd14940F9997EE611496De6"
  },
  eth: {
    name: 'eth',
    url: process.env.ETH_NODE_URL,
    contract: process.env.ETH_LZ_CONTRACT || "0x4D73AdB72bC3DD368966edD0f0b2148401A178E2",
    lzEndpointContract: process.env.ETH_LZ_ENDPOINT || "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675",
    multisigContract: process.env.ETH_MULTISIG || "0x715CdDa5e9Ad30A0cEd14940F9997EE611496De6"
  },
  version: process.env.npm_package_version || '0.0.1',
  name: process.env.npm_package_name || '',
  port: parseInt(process.env.PORT, 10) || 8080,
});