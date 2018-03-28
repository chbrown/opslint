export default abstract class Rule {
  name: string
  description: string
  constructor(public filepath: string) { }
  /**
  check() determines whether the contextual `filepath`, in its current state,
  complies with this Rule. It returns a Promise (of nothing), which is thrown /
  rejected with some description of how `filepath` does not adhere to the rule.
  There is no result payload; non-failure implies compliance.
  */
  abstract check(): Promise<void>
  /**
  fix() tries to modify `filepath` to bring it into compliance with this Rule.
  Returns a (Promise of a) boolean, which is:
  - true if something was modified,
    though there might be false positives if we're being lazy
  - false if nothing was changed
  It may throw! But it should not return null / undefined. */
  abstract fix(): Promise<boolean>
}
