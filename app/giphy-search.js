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

function copyGif(gif) {
	const data = gif.getAttribute('src')

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
		const divContainer = document.createElement('div')
		const sharerDiv = document.createElement('div')
		const gifMediaLink = selectedGif.url
		const gifBitly = gif.bitly_gif_url
		const gifStandardLink = gif.url

		const fbLink = `http://www.facebook.com/sharer/sharer.php?u=${gifBitly}`
		const rdLink = `http://www.reddit.com/submit?url=${gifStandardLink}`
		const twLink = `http://twitter.com/share?url=${gifBitly}?tc=1`
		const trLink = `http://www.tumblr.com/widgets/share/tool?canonicalUrl=${gifStandardLink}&content=${gifMediaLink}`

		// Render per image
		resultElement.className = 'giphy'
		resultElement.src = gifMediaLink
		resultElement.addEventListener('click', () => {
			if (this) {
				copyGif(this)
				console.log('link copied to clipboard')
			}
		})
		resultElement.addEventListener('error', () => {
			if (this) {
				this.hide()
			}
		})
		resultElement.addEventListener('mouseenter', () => {
			if (sharerDiv) {
				sharerDiv.style.transform = 'translateY(0)'
			}
		})
		resultElement.addEventListener('mouseleave', evt => {
			if (sharerDiv) {
				if (evt.toElement) {
					if (evt.toElement.className === 'sharer') {
						return
					}
				}

				sharerDiv.style.transform = 'translateY(35px)'
			}
		})

		// Render sharer div
		sharerDiv.className = 'sharer'
		sharerDiv.addEventListener('mouseleave', evt => {
			if (evt.toElement) {
				if (evt.toElement.className === 'giphy') {
					sharerDiv.style.transform = 'translateY(35px)'
				}
			}
		})
		const fb = document.createElement('button')
		const rd = document.createElement('button')
		const tr = document.createElement('button')
		const tw = document.createElement('button')
		fb.className = 'facebook'
		fb.addEventListener('click', () => {
			electron.shell.openExternal(fbLink)
		})

		rd.className = 'reddit'
		rd.addEventListener('click', () => {
			electron.shell.openExternal(rdLink)
		})

		tr.className = 'tumblr'
		tr.addEventListener('click', () => {
			electron.shell.openExternal(trLink)
		})

		tw.className = 'twitter'
		tw.addEventListener('click', () => {
			electron.shell.openExternal(twLink)
		})

		// Render container for sharer and img
		divContainer.className = 'image-gif'

		// Appends
		sharerDiv.appendChild(fb)
		sharerDiv.appendChild(rd)
		sharerDiv.appendChild(tr)
		sharerDiv.appendChild(tw)
		divContainer.appendChild(resultElement)
		divContainer.appendChild(sharerDiv)
		fragment.appendChild(divContainer)
	})
	containerElement.appendChild(fragment)
}
