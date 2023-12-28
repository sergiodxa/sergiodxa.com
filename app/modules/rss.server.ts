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
	private items = new Set<Item>();

	constructor(private channel: Channel) {}

	addItem(item: Item) {
		this.items.add(item);
	}

	toString() {
		return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${this.channel.title}</title>
    <description>${this.channel.description}</description>
    <link>${this.channel.link}</link>
    ${Array.from(this.items)
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
}
