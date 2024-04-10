document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('chalkboardCanvas');
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';
    let isDrawing = false;
    let isErasing = false;

    function startDrawing(e) {
        isDrawing = true;
        isErasing = false;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }

    function startErasing(e) {
        isDrawing = true;
        isErasing = true;
        ctx.globalCompositeOperation = 'destination-out'; // Set the composite operation to erase
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
        ctx.globalCompositeOperation = 'source-over'; // Reset the composite operation to draw
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
    document.getElementById('eraseButton').addEventListener('click', () => {
        isErasing = true;
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