document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('chalkboardCanvas');
    const ctx = canvas.getContext('2d');
    const drawLineWidth = 5;
    const eraseLineWidth = 20; // Larger line width for eraser
    ctx.strokeStyle = 'white';
    ctx.lineCap = 'round';
    let isDrawing = false;
    let isErasing = false;

    function startDrawing(e) {
        isDrawing = true;
        ctx.lineWidth = isErasing ? eraseLineWidth : drawLineWidth; // Set the lineWidth based on mode
        ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
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
        ctx.closePath();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Hook up the clear function to a button if needed
    document.getElementById('clearButton').addEventListener('click', clearCanvas);

    // Hook up the erase function when the erase button is clicked
    document.getElementById('eraseButton').addEventListener('click', function() {
        // Toggle erasing mode
        isErasing = !isErasing;
        // Change the button text based on erasing mode
        this.textContent = isErasing ? 'Draw' : 'Erase';
    });

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

    function fetchDataAndUpdateOutputs() {
        fetch('http://localhost:3000/outputs')
            .then(response => response.json())
            .then(data => {
                document.getElementById('hindiOutput').value = data.hindi;
                document.getElementById('englishOutput').value = data.english;
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    setInterval(takeSnapshot, 500);
    setInterval(fetchDataAndUpdateOutputs, 500);
});