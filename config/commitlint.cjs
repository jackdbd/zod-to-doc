/**
 * Configuration for commitlint.
 *
 * @see [commitlint-config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)
 * @see [commitlint-rules](https://github.com/conventional-changelog/commitlint/blob/master/docs/reference-rules.md)
 * @see [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/)
 */
const config = {
  // commitlint configuration that enforces conventional commits.
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (message) => {
      return message.includes('initial commit')
    }
  ],
  rules: {
    // I configured semantic-release git plugin to create a release commit
    // message containing release notes in the commit body. This would exceed
    // the limit set by the config-conventional preset. So I override the rule.
    'body-max-line-length': [2, 'always', Infinity]
  }
}

// The Convential Commits specification enforces this structure for commit messages:
//////////////////////////
// type(scope): subject //
//////////////////////////
// `type` and `subject` are required, while `scope` is optional.
// The Convential Commits specification allows any string as the `type`. However,
// commitlint/config-conventional defines these types:
// - build
// - chore
// - ci
// - docs
// - feat (triggers a MINOR release)
// - fix (triggers a PATCH release)
// - perf
// - refactor
// - revert
// - style
// - test

module.exports = config
