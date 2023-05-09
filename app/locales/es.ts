export default {
	header: { title: "Sergio Xalambrí" },

	nav: {
		home: "Inicio",
		articles: "Artículos",
		bookmarks: "Bookmarks",
		tutorials: "Tutoriales",
		sponsor: "Apoyame en GitHub",
		login: "Acceso",
		logout: "Cerrar sesión",
	},

	home: {
		header: {
			title: "Sergio Xalambrí",
			description:
				"Soy un desarrolladores web de Buenos Aires, Argentina. Trabajo en <strong>Daffy</strong> como desarrollador web.",
		},

		feed: {
			title: "Actividad",
			description: "La última actividad en mi sitio",

			article: "Escribí sobre <link:article>{{title}}</link:article>",

			tutorial: "Publiqué cómo <link:tutorial>{{title}}</link:tutorial>",

			bookmark:
				"Leí <link:bookmark>{{title}}</link:bookmark> y lo guardé como bookmark",
		},
	},

	articles: {
		404: "404 No encontrado",
		empty:
			"La URL /articles?page={{page}} no se pudo encontrar en el servidor.",
		title: "Artículos",

		meta: {
			title: {
				default: "Artículos de sergiodxa",
				search:
					"Resultados de búsqueda para '{{term}}' en el blog de sergiodxa",
			},
		},

		header: {
			title: "Artículos",
			description: "Estos son mis artículos.",
		},

		description: {
			search:
				"Mostrando {{count}} artículos para la búsqueda <highlight>{{term}}</highlight>",
			default: "Estos son mis artículos.",
		},

		search: {
			title: "Buscador",
			placeholder: "Remix, SWR, Next, Rails…",
			button: {
				progress: "Buscando…",
				default: "Buscar",
			},
		},
		nav: {
			prev: "Artículos anteriores",
			next: "Siguientes artículos",
		},
	},

	article: { meta: { title: "{{note}} por sergiodxa" } },

	bookmarks: {
		meta: { title: "Bookmarks de sergiodxa" },

		header: {
			title: "Bookmarks",
			description: "Links que leí y me gustaron.",
		},
	},

	login: {
		title: "Accedé a tu cuenta",
		github: "Continuar con GitHub",
		error: {
			title: "Hubo un problema",
			description:
				"Ocurrió un error al intentar acceder a tu cuenta con GitHub.",
		},
	},

	logout: {
		title: "¿Estás seguro?",
		cta: "Cerrar sesión",
	},

	tutorials: {
		meta: {
			title: {
				default: "Tutoriales de sergiodxa",
				search: "Tutorialess sobre {{query}} de sergiodxa",
			},
		},

		header: {
			title: "Tutoriales",
			description: "Aprendé sobre Remix, React, y más.",
		},

		search: {
			label: "Buscar tutoriales",
			placeholder: "Remix, React, Next…",
			button: {
				progress: "Buscando…",
				default: "Buscar",
			},
		},

		pagination: {
			first: "Más nuevos",
			prev: "Siguientes",
			next: "Anteriores",
			last: "Más viejos",
		},
	},

	tutorial: {
		document: {
			title: "Cómo {{title}} por sergiodxa",
		},
		header: {
			eyebrown: "Cómo",
			edit: "Editar en GitHub",
		},
		tags: "Usé",
		related: {
			title: "Relacionados",
			reason: "Porque ambos usan {{tag}}",
		},
	},

	error: {
		NOT_FOUND: "404 No encontrado",
		NOTE_NOT_FOUND: "El artículo {{path}} no se pudo encontrar",
	},
};
