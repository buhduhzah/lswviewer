// server.cjs
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const fetchAllNFTs = async () => {
    const nfts = [];
    for (let i = 1; i <= 333; i++) {
        nfts.push({
            "name": `Little Swag World: HEXP #${i}`,
            "description": "",
            "image": `https://gateway.irys.xyz/HxDiMgQxkvmKaRQGvSt4ZKvdpUrooWwsvEdKekNDMfcR/${i}.png`,
            "animation_url": `https://gateway.irys.xyz/DPqbYM58TVrKYV3hKyHmq4H7fWGdXN8pqaeqNDm47Cr6/${i}.mp4`
        });
    }
    
    console.log(`Generated ${nfts.length} NFT metadata objects`);
    return nfts;
};

app.get('/nft-data', async (req, res) => {
    try {
        const allNFTs = await fetchAllNFTs();
        console.log(`Sending ${allNFTs.length} NFTs to client`);
        res.json(allNFTs);
    } catch (error) {
        console.error('Error in /nft-data route:', error);
        res.status(500).json({ error: 'Failed to fetch NFT data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});