// app.js
document.addEventListener('DOMContentLoaded', async () => {
    const nftContainer = document.getElementById('nft-container');
    const toggleButton = document.getElementById('toggle-button');
    const LOCAL_API_URL = '/api/nft-data';
    let showingImages = true;
    let allNFTs = [];
    let currentIndex = 0;
    const BATCH_SIZE = 50;

    function loadMoreNFTs() {
        const endIndex = Math.min(currentIndex + BATCH_SIZE, allNFTs.length);
        const batch = allNFTs.slice(currentIndex, endIndex);
        
        batch.forEach((nft, index) => {
            const nftDiv = document.createElement('div');
            nftDiv.classList.add('nft-item');

            if (showingImages) {
                if (nft.image) {
                    const nftImage = document.createElement('img');
                    nftImage.src = nft.image;
                    nftImage.alt = nft.name || `NFT ${currentIndex + index + 1}`;
                    nftImage.loading = 'lazy';
                    nftDiv.appendChild(nftImage);
                }
            } else {
                if (nft.animation_url) {
                    const placeholder = document.createElement('div');
                    placeholder.classList.add('video-placeholder');
                    placeholder.textContent = 'Loading video...';
                    
                    const nftVideo = document.createElement('video');
                    nftVideo.muted = true;
                    nftVideo.loop = true;
                    nftVideo.playsInline = true;
                    nftVideo.style.display = 'none';
                    
                    const loadingSpinner = document.createElement('div');
                    loadingSpinner.classList.add('loading-spinner');
                    placeholder.appendChild(loadingSpinner);

                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                if (!nftVideo.src) {
                                    nftVideo.src = nft.animation_url;
                                    nftVideo.addEventListener('loadeddata', () => {
                                        placeholder.style.display = 'none';
                                        nftVideo.style.display = 'block';
                                        nftVideo.play().catch(console.error);
                                    });
                                }
                            } else {
                                if (nftVideo.src) {
                                    nftVideo.pause();
                                    nftVideo.removeAttribute('src');
                                    nftVideo.load();
                                    nftVideo.style.display = 'none';
                                    placeholder.style.display = 'flex';
                                }
                            }
                        });
                    }, {
                        threshold: 0.1,
                        rootMargin: '100px'
                    });

                    nftDiv.appendChild(placeholder);
                    nftDiv.appendChild(nftVideo);
                    observer.observe(nftDiv);
                }
            }

            // Fullscreen click handler
            nftDiv.onclick = () => {
                const modal = document.createElement('div');
                modal.className = 'modal';
                
                const closeBtn = document.createElement('button');
                closeBtn.className = 'close-modal';
                closeBtn.innerHTML = '×';
                closeBtn.onclick = (e) => {
                    e.stopPropagation();
                    modal.remove();
                };
                
                if (showingImages) {
                    const fullImage = document.createElement('img');
                    fullImage.src = nft.image;
                    modal.appendChild(fullImage);
                } else {
                    const fullVideo = document.createElement('video');
                    fullVideo.src = nft.animation_url;
                    fullVideo.controls = true;
                    fullVideo.autoplay = true;
                    fullVideo.loop = true;
                    modal.appendChild(fullVideo);
                }
                
                modal.appendChild(closeBtn);
                document.body.appendChild(modal);
                modal.style.display = 'flex';
                
                modal.onclick = (e) => {
                    if (e.target === modal) {
                        modal.remove();
                    }
                };
            };

            if (nftDiv.hasChildNodes()) {
                nftContainer.appendChild(nftDiv);
            }
        });

        currentIndex = endIndex;
    }

    const handleScroll = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            if (currentIndex < allNFTs.length) {
                loadMoreNFTs();
            }
        }
    };

    try {
        const response = await fetch(LOCAL_API_URL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        allNFTs = await response.json();

        loadMoreNFTs();
        window.addEventListener('scroll', handleScroll);

        toggleButton.addEventListener('click', () => {
            showingImages = !showingImages;
            currentIndex = 0;
            nftContainer.innerHTML = '';
            loadMoreNFTs();
            toggleButton.textContent = showingImages ? 'Show Videos' : 'Show Images';
        });

    } catch (error) {
        console.error('Error:', error);
        nftContainer.innerHTML = `<p>Error loading NFTs: ${error.message}</p>`;
    }
});