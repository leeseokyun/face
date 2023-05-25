const imageUpload = document.getElementById('imageUpload')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  document.body.append('Loaded')

  const facesContainer = document.createElement('div')
  facesContainer.style.display = 'flex'
  facesContainer.style.flexWrap = 'wrap'
  facesContainer.style.justifyContent = 'space-between' // 수정된 부분: 사진 간격을 늘리기 위한 스타일
  facesContainer.style.marginTop = '0px'
  container.append(facesContainer)

  imageUpload.addEventListener('change', async () => {
    const image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    const canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)

    resizedDetections.forEach((detection, i) => {
      const box = detection.detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: 'face' })
      drawBox.draw(canvas)

      const faceContainer = document.createElement('div')
      faceContainer.style.position = 'relative'
      faceContainer.style.margin = '5px'
      faceContainer.style.padding = '5px'
      facesContainer.append(faceContainer)

      const faceCanvas = document.createElement('canvas')
      faceCanvas.width = box.width
      faceCanvas.height = box.height
      const faceContext = faceCanvas.getContext('2d')
      faceContext.drawImage(
        image,
        box.x,
        box.y,
        box.width,
        box.height,
        0,
        0,
        box.width,
        box.height
      )
      faceContainer.append(faceCanvas)

      const faceLabel = document.createElement('p')
      faceLabel.textContent = `Face ${i + 1}`
      faceLabel.style.position = 'absolute'
      faceLabel.style.bottom = '0'
      faceLabel.style.left = '0'
      faceLabel.style.margin = '0'
      faceLabel.style.padding = '5px'
      faceContainer.append(faceLabel)
    })
  })
}
