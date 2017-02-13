const electron = require('electron')

export default function socialShare(social, gifLink, gifMediaLink) {
	const services = {
		facebook: `http://www.facebook.com/sharer/sharer.php?u=${gifLink}`,
		reddit: `http://www.reddit.com/submit?url=${gifLink}`,
		twitter: `http://twitter.com/share?url=${gifLink}?tc=1`,
		tumblr: `http://www.tumblr.com/widgets/share/tool?canonicalUrl=${gifLink}&content=${gifMediaLink}`
	}

	const service = services[social]

	electron.shell.openExternal(service)
}
