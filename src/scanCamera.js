
export class ScanCamera {
  constructor(id) {
    this.el = document.getElementById(id);
    this.ctx = this.el.getContext("2d");
    this.video = null;
  }

  setup() {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
      .then(stream => this.createVideo(stream))
      .then(video => {
        this.el.width = video.clientWidth;
        this.el.height = video.clientHeight;
        this.video = video;
        this.ctx.translate(this.el.width, 0);
        this.ctx.scale(-1, 1);
        this.drawing = true;
        this.loop(video);
      })
      .catch(this.handleError);
  }

  loop(video) {
    if (!this.drawing) return;
    this.ctx.drawImage(video, 0, 0, this.el.width, this.el.height);
    requestAnimationFrame(() => this.loop(video))
  }

  scan(line = 1) {
    this.stop();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#FF0000';
    if (line === this.el.height) return;
    if (line > 3) {
      const snap = this.ctx.getImageData(0, 0, this.el.width, line - 1);
      this.ctx.drawImage(this.video, 0, 0, this.el.width, this.el.height);
      this.ctx.putImageData(snap, 0, 0);
    } else {
      this.ctx.drawImage(this.video, 0, 0, this.el.width, this.el.height);
    }
    this.drawStroke(line);
    requestAnimationFrame(() => this.scan(line + 1));
  }

  drawStroke(pos) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, pos + 2);
    this.ctx.lineTo(this.el.width, pos + 2);
    this.ctx.stroke();
  }

  createVideo(stream) {
    return new Promise(res => {
      const video = document.createElement('video');
      video.style.visibility = "hidden";
      video.style.transform = "scaleX(-1)";
      document.body.appendChild(video);
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", (e) => {
        res(video);
      }, false);
    })
  }

  stop() {
    this.drawing = false;
  }

  handleError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
  }
}