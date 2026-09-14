export class ForbiddenPostAccessError extends Error {
  constructor() {
    super('You do not have permission to modify this post')
    this.name = 'ForbiddenPostAccessError'
  }
}
