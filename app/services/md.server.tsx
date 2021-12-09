import { marked, Renderer } from "marked";
import { renderToString } from "react-dom/server";

export class GitHubRenderer extends Renderer {
  constructor(private repo: string) {
    super();
  }

  image(src: string, alt: string | null) {
    let url = src.startsWith("http")
      ? src
      : `https://github.com/sergiodxa/${this.repo}/raw/main/${src}`;
    return renderToString(<img src={url} alt={alt ?? ""} />);
  }
}

export function render(
  markdown: string,
  options: marked.MarkedOptions = {}
): string {
  return marked(markdown, {
    ...options,
    breaks: true,
    gfm: true,
    headerIds: true,
  });
}
