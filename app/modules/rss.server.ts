import { parseFeed } from "htmlparser2";

interface Item {
	guid: string;
	title: string;
	description: string;
	link: string;
	pubDate: string;
}

interface Channel {
	title: string;
	description: string;
	link: string;
}

export class RSS {
	private itemSet = new Set<Item>();

	readonly channel: Channel;
	constructor(channel: Channel) {
		this.channel = channel;
	}

	get items() {
		return Array.from(this.itemSet);
	}

	addItem(item: Item) {
		this.itemSet.add(item);
	}

	removeItem(guid: string) {
		let item = [...this.itemSet].find((item) => item.guid === guid);
		if (item) this.itemSet.delete(item);
	}

	toJSON() {
		return {
			channel: this.channel,
			items: Array.from(this.itemSet),
		};
	}

	toString() {
		return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${this.channel.title}</title>
    <description>${this.channel.description}</description>
    <link>${this.channel.link}</link>
    ${this.items
			.map((item) => {
				return `<item>
        <guid>${item.guid}</guid>
        <title>${item.title}</title>
        <description>${item.description}</description>
        <link>${item.link}</link>
        <pubDate>${item.pubDate}</pubDate>
      </item>`;
			})
			.join("\n")}
  </channel>
</rss>`;
	}

	static async fetch(url: URL) {
		let response = await fetch(url, {
			method: "GET",
			headers: { "cache-control": "no-cache, no-store" },
		});

		if (!response.ok) throw new Error("Failed to fetch RSS feed");
		if (!response.headers.get("Content-Type")?.includes("application/xml")) {
			throw new Error("Invalid Content-Type");
		}

		let text = await response.text();

		let feed = parseFeed(text, { xmlMode: true });

		if (!feed) throw new Error("Invalid RSS feed");

		if (!feed.title || !feed.description || !feed.link) {
			throw new Error("Invalid RSS feed");
		}

		let rss = new RSS({
			title: feed.title,
			description: feed.description,
			link: feed.link,
		});

		for (let { id, title, description, link, pubDate } of feed.items) {
			if (!id || !title || !description || !link || !pubDate) {
				throw new Error("Invalid RSS feed");
			}

			rss.addItem({
				guid: id,
				link,
				title,
				pubDate: pubDate.toISOString(),
				description,
			});
		}

		return rss;
	}
}
