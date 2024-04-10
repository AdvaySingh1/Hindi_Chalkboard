document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('chalkboardCanvas');
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';

    let isDrawing = false;

    function startDrawing(e) {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }

    function draw(e) {
        if (!isDrawing) return;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    function sendSnapshotToServer(imageData) {
        fetch('http://localhost:3000/upload-snapshot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageData })
        })
        .then(response => {
            // Check if response was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse JSON response
        })
        .then(data => console.log(data.message))
        .catch((error) => console.error('Error:', error));
    }

    function takeSnapshot() {
        const imageData = canvas.toDataURL('image/png');
        sendSnapshotToServer(imageData);
    }

    setInterval(takeSnapshot, 500);
});