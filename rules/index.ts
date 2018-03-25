/**
Failed checks are handled differently from errors.
*/
export type RulePromise = Promise<string[]>

export abstract class Rule {
  name: string
  description: string
  constructor(public filepath: string) { }
  abstract async check(): RulePromise
  abstract async fix(): RulePromise
}
