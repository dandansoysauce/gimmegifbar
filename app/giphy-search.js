const electron = require('electron')
const giphy = require('giphy-api')()

const clipboard = electron.clipboard
const ipc = electron.ipcRenderer
const searchInput = document.querySelector('.js-search')
const resultsDiv = document.querySelector('.js-results')

let off = 0
let searching = false

searchInput.dataset.isSearchInput = true
searchInput.focus()
search('')

searchInput.addEventListener('input', function () {
	if (this.value.length === 0) {
		resultsDiv.innerHTML = ''
		search('', 0)
	} else {
		resultsDiv.innerHTML = ''
		search(this.value.toLowerCase(), 0)
	}
})

window.addEventListener('scroll', () => {
	if (this.innerHeight + window.scrollY >= document.body.offsetHeight) {
		off += 25
		search(searchInput.value.toLowerCase(), off)
	}
})

document.addEventListener('click', evt => {
	if (evt.target.classList.contains('giphy')) {
		copyGif(evt.target, evt.shiftKey)
	}
})

document.addEventListener('keydown', evt => {
	if (evt.keyCode === 27) {
		ipc.send('abort')
	}
})

ipc.on('show', () => {
	searchInput.focus()
})

function copyGif(gif, copyText) {
	let data

	if (copyText) {
		data = gif.getAttribute('src')
	} else {
		data = gif.getAttribute('src')
	}

	clipboard.writeText(data)
	searchInput.value = ''
	search('', 0)
	off = 0
	ipc.send('abort')
}

function search(query, off) {
	if (searching) {
		clearTimeout(searching)
	}

	searching = setTimeout(() => {
		if (query.length !== 0) {
			giphy.search({
				q: query,
				offset: off
			}).then(res => {
				renderResults(res.data, resultsDiv)
			})
		}
	}, 1000)
}

function renderResults(gifsArray, containerElement) {
	containerElement.innerHTHML = ''
	const fragment = document.createDocumentFragment()
	gifsArray.forEach(gif => {
		const selectedGif = gif.images.fixed_height_downsampled
		const resultElement = document.createElement('img')
		resultElement.className = 'giphy'
		resultElement.src = selectedGif.url
		resultElement.addEventListener('error', () => {
			if (this) {
				this.hide()
			}
		})
		fragment.appendChild(resultElement)
	})
	containerElement.appendChild(fragment)
}
