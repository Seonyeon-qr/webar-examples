class Either {
    constructor(value) {
        this._value = value;
    }
    value() {
        return this._value;
    }
    static fromNullable(a) {
        return (typeof a !== 'undefined' || (!a && typeof a === 'object') ? Either.left(a) : Either.right(a));
    }
    static left(a) {
        return new Left(a);
    }
    static right(a) {
        return new Right(a);
    }
    static of(a) {
        return Either.right(a);
    }
}

class Left extends Either {
    constructor(unexpectedResult) {
        super(unexpectedResult);
    }
    map (fn) {
        return this;
    }
    value () {
        throw new TypeError(`Can't extract value from a Left() monad`);
    }
    getOrElse (other) {
        return other;
    }
    orElse (fn) {
        return fn(this._value);
    }
    getOrElseThrow (a) {
        throw new Error(a);
    }
    filter (fn) {
        return this;
    }
    get isNothing () {
        return true;
    }
    toString () {
        return `[object Either.Left] (value: ${this._value})`;
    }
}

class Right extends Either {
    constructor (value) {
        super(value);
    }
    value () {
        return this._value;
    }
    getOrElse () {
        return this.value;
    }
    orElse () {
        return this;
    }
    getOrElseThrow (a) {
        return this.value;
    }
    chain (fn) {
        return fn(this.value);
    }
    filter (fn) {
        return Either.fromNullable(fn(this.value) ? this.value : null);
    }
    toString() {
        return `[object Either.Right] (value: ${this._value})`;
    }
}

/**
 * letsee SDK 의 entity 등록 API 를 활용하여 XR 공간 생성을 위한 인식 대상을 생성 및 등록
 *
 * param    URI
 * return   Promise<Either>
 */
class EntityFactory {
    constructor() {}

    static addEntity(uri) {
        const result = letsee.addTarget(uri)
            .then(entity => {
                return Either.right(entity);
            })
            .catch(err => {
                return Either.left(`Can't add the target to letsee.`);
            });
        return result;
    }
}

export { Either, Left, Right, EntityFactory };