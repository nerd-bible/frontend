// TODO: fork @fluent/syntax/FluentSerializer
export function minify(ftl: string) {
	return ftl.replace(/^([\w_-]+)\s+=\s+/gm, "$1=").trim();
}
