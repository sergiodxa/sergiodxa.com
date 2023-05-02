/**
 * Detect if a computer is a Mac, iPhone, iPod or iPad
 * @return If it's or not
 */
export function isMac() {
	return !!navigator.userAgent.match(/(Mac|iPhone|iPod|iPad)/i);
}
