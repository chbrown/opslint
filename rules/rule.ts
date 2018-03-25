export default abstract class Rule {
  name: string
  description: string
  constructor(public filepath: string) { }
  abstract async check(): Promise<string[]>
  abstract async fix(): Promise<string[]>
}
