// https://gist.github.com/Eptagone/a18be9adabaf8ecc54d1c4e6337c95b2
import type {
	CustomAtRules,
	Function as LFunction,
	ParsedComponent,
	ReturnedDeclaration,
	ReturnedRule,
	TokenOrValue,
	Visitor,
} from "lightningcss";
import { composeVisitors } from "lightningcss";

function defineVisitor(
	visitor: Visitor<CustomAtRules> | (() => Visitor<CustomAtRules>),
): Visitor<CustomAtRules> {
	return typeof visitor === "function" ? visitor() : visitor;
}

function transformFunctionIntoColor(
	tokenOrValue: TokenOrValue & { type: "function"; value: LFunction },
): TokenOrValue {
	// lightness, chroma, hue
	let [l, c, h, alpha] = tokenOrValue.value.arguments
		.filter(
			(
				arg,
			): arg is TokenOrValue & { value: { type: "number"; value: number } } =>
				arg.type === "token" && arg.value.type === "number",
		)
		.map((arg) => arg.value.value);
	l ??= 0;
	c ??= 0;
	h ??= 0;
	alpha ??= 1;

	const oklchColor: TokenOrValue = {
		type: "color",
		value: {
			type: "oklch",
			l,
			c,
			h,
			alpha,
		},
	};
	return oklchColor;
}

/**
 * Fix oklch colors which are detected as functions instead of colors.
 */
const FixOklchColorsVisitor = defineVisitor({
	Declaration(
		declaration,
	): ReturnedDeclaration | ReturnedDeclaration[] | undefined {
		let needsUpdate = false;
		if (declaration.property === "custom") {
			for (let index = 0; index < declaration.value.value.length; index++) {
				const tokenOrValue = declaration.value.value[index];
				if (
					tokenOrValue?.type === "function" &&
					tokenOrValue.value.name === "oklch"
				) {
					declaration.value.value[index] =
						transformFunctionIntoColor(tokenOrValue);
					needsUpdate = true;
				}
			}
		}
		if (needsUpdate) {
			return declaration;
		}
	},
});

/**
 * Replaces all \@property rules with css variables.
 */
const ReplacePropertyRulesVisitor = defineVisitor(() => {
	function transformComponentIntoTokensOrValues(
		component: ParsedComponent,
	): TokenOrValue[] {
		switch (component.type) {
			case "color":
				return [component];
			case "length":
				if (component.value.type !== "value") {
					throw new Error(
						`Cannot map component of type: ${component.type}.\nValue: ${JSON.stringify(component, undefined, 2)}`,
					);
				}
				return [
					{
						type: "length",
						value: component.value.value,
					},
				];
			case "length-percentage":
				if (component.value.type !== "percentage") {
					throw new Error(
						`Cannot map component of type: ${component.type}.\nValue: ${JSON.stringify(component, undefined, 2)}`,
					);
				}
				return [
					{
						type: "token",
						value: component.value,
					},
				];
			case "token-list":
				return component.value;
			case "percentage":
				return [
					{
						type: "token",
						value: {
							type: "percentage",
							value: component.value,
						},
					},
				];
		}

		throw new Error(
			`Unexpected component type: ${component.type}.\nValue: ${JSON.stringify(component, undefined, 2)}`,
		);
	}
	let legacyCssVariables: Record<string, TokenOrValue[]> = {};

	return {
		StyleSheet(stylesheet) {
			const propertyRules = stylesheet.rules.filter(
				(rule) => rule.type === "property",
			);
			for (const rule of propertyRules) {
				if (rule.value.initialValue) {
					legacyCssVariables[rule.value.name] =
						transformComponentIntoTokensOrValues(rule.value.initialValue);
				}
			}
		},
		Rule(rule): ReturnedRule | ReturnedRule[] | undefined {
			if (rule.type === "property") {
				return [];
			}

			if (rule.type === "style") {
				const selectors = rule.value.selectors.flat();
				for (const selector of selectors) {
					if (selector.type === "pseudo-class" && selector.kind === "root") {
						for (const [name, value] of Object.entries(legacyCssVariables)) {
							rule.value.declarations.declarations.push({
								property: "custom",
								value: { name, value },
							});
						}
						legacyCssVariables = {};
						return rule;
					}
				}
			}
		},
	};
});

/**
 * Replaces all var(--color-*) with css variables in each color-mix function.
 */
const ReplaceColorMixVariablesVisitor = defineVisitor(() => {
	const colorVariables: Record<string, TokenOrValue> = {};
	return {
		Declaration(
			declaration,
		): ReturnedDeclaration | ReturnedDeclaration[] | undefined {
			if (declaration.property === "custom") {
				if (declaration.value.name.startsWith("--color-")) {
					for (let index = 0; index < declaration.value.value.length; index++) {
						const tokenOrValue = declaration.value.value[index];
						if (tokenOrValue?.type === "color") {
							colorVariables[declaration.value.name] = tokenOrValue;
						}
						if (
							tokenOrValue?.type === "function" &&
							tokenOrValue.value.name === "oklch"
						) {
							colorVariables[declaration.value.name] =
								transformFunctionIntoColor(tokenOrValue);
						}
					}
				}
			}
			return;
		},
		Function(fun): TokenOrValue | TokenOrValue[] | undefined {
			let needsUpdate = false;
			if (fun.name === "color-mix") {
				for (let index = 0; index < fun.arguments.length; index++) {
					const arg = fun.arguments[index];
					if (arg?.type === "var") {
						const value = colorVariables[arg.value.name.ident];
						if (value) {
							needsUpdate = true;
							// Replace the argument with the color value.
							fun.arguments[index] = value;
							// If the next argument is a percentage, add a white-space between them.
							const nextArg = fun.arguments[index + 1];
							if (
								nextArg?.type === "token" &&
								nextArg.value.type === "percentage"
							) {
								fun.arguments.splice(index + 1, 0, {
									type: "token",
									value: { type: "white-space", value: " " },
								});
							}
						}
					}
				}
			}
			if (needsUpdate) {
				return {
					type: "function",
					value: fun,
				};
			}
		},
	};
});

/**
 * Custom polyfill for TailwindCSS v4.
 */
const TailwindPolyfillVisitor: Visitor<CustomAtRules> = composeVisitors([
	FixOklchColorsVisitor,
	// ReplacePropertyRulesVisitor,
	ReplaceColorMixVariablesVisitor,
]);

export default TailwindPolyfillVisitor;
