(() => {
    const width = 500;
    let height = 0;

    let streaming = false;

    let video = null;
    let canvas = null;
    let output = null;
    let startbutton = null;
    let overlay = null;
    let offButton = null;

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        output = document.getElementById('output');
        overlay = document.getElementById('overlay');
        startbutton = document.getElementById('startbutton');
        offButton = document.getElementById('disable');

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
            .then((stream) => {
                video.srcObject = stream;
                video.play();
            })
            .catch((err) => {
                console.error(`An error occurred: ${err}`);
            })

        video.addEventListener('canplay', (ev) => {
            if (!streaming) {
                height = (video.videoHeight) / (video.videoWidth / width);

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                console.log(height);
                console.log(video.offsetHeight);
                console.log(overlay.offsetHeight - 9);
                console.log(video.offsetHeight - (overlay.offsetHeight - 9));
                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                overlay.style.left = (video.offsetWidth - (overlay.offsetWidth - 9)) / 2 + 'px';
                overlay.style.top = (video.offsetHeight - (overlay.offsetHeight - 9)) / 2 + 'px';
                streaming = true;
            }
        })

        startbutton.addEventListener('click', (ev) => {
            takePicture();
            ev.preventDefault();
        }, true)

        clearphoto();
    }

    function clearphoto() {
        const context = canvas.getContext('2d');
        context.fillStyle = '#AAA';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const data = canvas.toDataURL('image/png');
        output.innerHTML = '';
    }

    function takePicture() {
        const context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            const data = canvas.toDataURL('image/png');
            readImage(data);
            return;
        } else {
            clearphoto();
        }
    }

    window.addEventListener('load', startup, false);

    async function readImage(file) {
        console.log('Reading Image');
        const { createWorker } = Tesseract;
        console.log("initializing");
        const worker = await createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        console.log("initialized");
        const { data: { text } } = await worker.recognize(file, { rectangle: { top: (height - (overlay.offsetHeight - 9)) / 2, left: (width - (overlay.offsetWidth - 9)) / 2, width: (overlay.offsetWidth - 9), height: (overlay.offsetHeight - 9) }, });
        console.log(text);
        output.innerHTML = text;
    }
})();