export class BaseModel {
  // ts中形参默认为private
  constructor(public data?, public message?) {
    if (typeof data === 'string') {
      this.message = data
      data = null
      message = null
    }
    if (data) {
      this.data = data
    }
    if (message) {
      this.message = message
    }
  }
}

export class SuccessModel extends BaseModel {
  public errno: number
  constructor(data?, message?) {
    super(data, message)
    this.errno = 0
  }
}

export class ErrorModel extends BaseModel {
  public errno: number
  constructor(data, message?) {
    super(data, message)
    this.errno = -1
  }
}
