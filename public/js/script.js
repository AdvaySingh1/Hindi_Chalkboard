document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('chalkboardCanvas');
    const ctx = canvas.getContext('2d');
    const drawLineWidth = 10;
    const eraseLineWidth = 40;
    ctx.strokeStyle = 'white';
    ctx.lineCap = 'round';
    let isDrawing = false;
    let isErasing = false;
    // keep within range
    const centerX = canvas.width / 2 + 22;
    const centerY = canvas.height / 2 + 15;
    const squareSideLength = 280; // Set this to the side length of the square you want
    const halfSquareSideLength = squareSideLength / 2;

    // Check if the position is within the square boundary
    function isPositionInAllowedRange(x, y) {
        return x > centerX - halfSquareSideLength && x < centerX + halfSquareSideLength &&
               y > centerY - halfSquareSideLength && y < centerY + halfSquareSideLength;
    }
    
    // Modified event handlers
    function startDrawing(e) {
        if (isPositionInAllowedRange(e.offsetX, e.offsetY)) {
            isDrawing = true;
            ctx.lineWidth = isErasing ? eraseLineWidth : drawLineWidth;
            ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);  // Use cursor position directly without offsets
        }
    }
    
    function draw(e) {
        if (isDrawing && isPositionInAllowedRange(e.offsetX, e.offsetY)) {
            ctx.lineTo(e.offsetX, e.offsetY);  // Use cursor position directly without offsets
            ctx.stroke();
        }
    }
    
    function stopDrawing() {
        if (isDrawing) {
            ctx.closePath();
            isDrawing = false;
        }
    }
    
    function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    // If you've translated your context during the initial setup, reset it here.
    // Otherwise, no need to translate whatsoever.
    // Optionally redraw any static elements or backgrounds.
}

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Clear button
    document.getElementById('clearButton').addEventListener('click', clearCanvas);

    // Click button
    document.getElementById('eraseButton').addEventListener('click', function() {
        // Becan erasing and switch mode
        isErasing = !isErasing;
        // Switch mode
        this.textContent = isErasing ? 'Draw' : 'Erase';
    });
    // Connect to hosting which is me :)
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

    // Take the snapshot
    function convertToGrayscale(imgData) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgData.width;
        tempCanvas.height = imgData.height;
    
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imgData, 0, 0);
    
        const imgPixels = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    
        for (let y = 0; y < imgPixels.height; y++) {
            for (let x = 0; x < imgPixels.width; x++) {
                const i = (y * 4) * imgPixels.width + x * 4;
                const avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
                imgPixels.data[i] = avg;
                imgPixels.data[i + 1] = avg;
                imgPixels.data[i + 2] = avg;
            }
        }
        tempCtx.putImageData(imgPixels, 0, 0);
    
        return tempCanvas.toDataURL('image/png');
    }
    
    function takeSnapshot() {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any transformation before capturing
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.restore(); // Restore the transformations
        const imageData = convertToGrayscale(imgData); // Convert to grayscale
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

    setInterval(takeSnapshot, 100);
    setInterval(fetchDataAndUpdateOutputs, 100);
});