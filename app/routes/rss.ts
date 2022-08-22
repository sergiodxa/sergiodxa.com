export async function loader() {
	return fetch("https://collectednotes.com/sergiodxa/feed/public_site.rss");
}
