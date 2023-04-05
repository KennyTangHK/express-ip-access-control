/**
 * Create a AccessControl middleware
 * @param options options to configure the middleware
 */
declare function AccessControl(options?: AccessControl.AclOptions): (res: any, req: any, next: any) => void;

declare namespace AccessControl {
	/**
	 * Returns true if the clientIp address or range is within the list
	 * @param clientIp an IP address or range to find within the list
	 * @param list A list of IP addresses or ranges to match against
	 */
	function ipMatch(clientIp: string, list: string[]): boolean;

	/**
	 * Allows changing the default behavious of the middleware
	 */
	interface AclOptions {
		mode?: 'allow' | 'deny';
		denys?: string[];
		allows?: string[];
		forceConnectionAddress?: boolean;
		log?: false | ((clientIp: string, access: boolean) => void);
		statusCode?: string;
		redirectTo?: string;
		message?: string;
	}
}

export = AccessControl;
