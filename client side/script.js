document.addEventListener('DOMContentLoaded', fetchVideoList);

async function fetchVideoList() {
  try {
    const response = await fetch('http://your-server-endpoint/videoList');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const files = await response.json();
    const videoList = document.getElementById('video-list');
    videoList.innerHTML = '';
    files.forEach(file => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<i class="fas fa-play-circle video-icon"></i>${file.fileName}`;
      listItem.addEventListener('click', () => playVideo(file.url));
      videoList.appendChild(listItem);
    });
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

function playVideo(url) {
  const videoPlayer = document.getElementById('video-player');
  videoPlayer.src = url;
  videoPlayer.style.display = 'block';
  videoPlayer.play();
}
