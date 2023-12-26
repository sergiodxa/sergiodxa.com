export default {
	header: { title: "Sergio Xalambrí" },

	nav: {
		home: "Home",
		articles: "Articles",
		bookmarks: "Bookmarks",
		tutorials: "Tutorials",
		sponsor: "Sponsor me on GitHub",
		login: "Access",
		logout: "Sign Out",
	},

	home: {
		header: {
			title: "Sergio Xalambrí",
			description:
				"I'm a web developer from Buenos Aires, Argentina. I work at <strong>Daffy</strong> as a Web Developer.",
		},

		feed: {
			title: "Activity",
			description: "The latests activity on my website",

			article: "I wrote about <link:article>{{title}}</link:article>",

			tutorial: "I published how to <link:tutorial>{{title}}</link:tutorial>",

			bookmark:
				"I read <link:bookmark>{{title}}</link:bookmark> and bookmarked it",
		},
	},

	articles: {
		empty: {
			title: "No Results",
			body: "The requested URL /articles?q={{term}} was not found on this server.",
		},
		title: "Articles",
		meta: {
			title: {
				default: "Articles of sergiodxa",
				search: 'Search results for "{{term}}" on sergiodxa\' blog',
			},
		},
		header: {
			title: "Articles",
			description: "These are my articles.",
		},
		description: {
			search:
				"Showing {{count}} articles for the query <highlight>{{term}}</highlight>",
			default: "These are my articles.",
		},
		search: {
			label: "Search",
			placeholder: "Remix, SWR, Next, Rails…",
			button: {
				progress: "Searching…",
				default: "Search",
			},
		},
		nav: {
			prev: "Previous articles",
			next: "Next articles",
		},
	},

	article: { meta: { title: "{{note}} by sergiodxa" } },

	likes: {
		meta: { title: "Like of sergiodxa" },

		header: {
			title: "Likes",
			description: "Links that I read and liked.",
		},
	},

	bookmarks: {
		meta: { title: "Bookmarks of sergiodxa" },

		header: {
			title: "Bookmarks",
			description: "Links that I read and liked.",
		},
	},

	login: {
		title: "Access to your account",
		github: "Continue with GitHub",
		error: {
			title: "There is a problem",
			description: "There was an error trying to login with GitHub",
		},
	},

	logout: {
		title: "Are you sure you want to sign out?",
		cta: "Sign Out",
	},

	tutorials: {
		meta: {
			title: {
				default: "Tutorials by sergiodxa",
				search: "Tutorials about {{query}} by sergiodxa",
			},
		},

		header: {
			title: "Tutorials",
			description: "Learn about Remix, React, and more.",
		},

		search: {
			label: "Search tutorials",
			placeholder: "Remix, React, Next…",
			button: {
				progress: "Searching…",
				default: "Search",
			},
		},

		subscribe: {
			cta: "Subscribe to my tutorials using <rss>RSS</rss>.",
		},

		pagination: {
			first: "Newest",
			prev: "Newer",
			next: "Older",
			last: "Oldest",
		},
	},

	tutorial: {
		document: {
			title: "How to {{title}} by sergiodxa",
		},
		header: {
			eyebrown: "How to",
			edit: "Edit on GitHub",
		},
		tags: "Used",
		related: {
			title: "Related tutorials",
			reason: "Because both uses <anchor>{{tag}}</anchor>",
		},
	},

	support: {
		title: "Do you like my content?",
		cta: "Sponsor me on GitHub",
	},

	notFound: {
		title: "404 Not Found",
	},

	error: {
		NOT_FOUND: "404 Not Found",
		NOTE_NOT_FOUND: "The article {{path}} was not found",
	},

	write: {
		title: "Write something new",
	},

	editor: {
		button: {
			bold: "Bold",
			italic: "Italic",
			link: "Link",
			code: "Code",
			quote: "Quote",
			image: "Image",
			heading: "Heading",
		},
	},

	cms: {
		_index: {
			stats: {
				title: "Post Stats",
				total: {
					articles: "Total Articles",
					likes: "Total Likes",
					tutorials: "Total Tutorials",
				},
				viewAll: "View all",
			},
		},

		users: {
			search: { label: "What're you looking for?", cta: "Search" },
			table: {
				header: {
					name: "Name",
					role: "Role",
					email: "Email",
					createdAt: "Date Created",
					updatedAt: "Last Update",
				},
			},
		},

		likes: {
			search: { label: "What're you looking for?", cta: "Search" },
			import: { cta: "Import Bookmarks" },
			delete: { cta: "Delete", pending: "Deleting" },
			table: {
				header: {
					title: "Title",
					createdAt: "Date Created",
					updatedAt: "Last Update",
					actions: "Actions",
				},
			},
		},

		articles: {
			search: { label: "What're you looking for?", cta: "Search" },
			import: { cta: "Import Articles" },
			reset: { cta: "Reset Articles" },
			table: {
				header: {
					title: "Title",
					createdAt: "Date Created",
					updatedAt: "Last Update",
				},
			},
		},
	},
};
