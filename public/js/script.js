document.addEventListener("DOMContentLoaded", function() {
    // Get canvas element and setup drawing context
    const canvas = document.getElementById('chalkboardCanvas');
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#fff'; // Chalk-like white color
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    // Drawing state
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
    
    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Function to capture the drawing on the canvas every 0.5 seconds
    setInterval(() => {
        const canvasData = canvas.toDataURL(); // This captures the canvas drawing as a data URL
        // You can process the canvasData as needed, send it to a server, etc.
        console.log('Snapshot taken: ', canvasData); // As an example, this will log the data URL to the console.
    }, 500);
});