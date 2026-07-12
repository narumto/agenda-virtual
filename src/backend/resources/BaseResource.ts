export class BaseResource<T, R = any> {
  constructor(protected resource: T) {}

  toArray(): R {
    return this.resource as unknown as R;
  }

  static collection<T, R = any>(resources: T[]): R[] {
    const ResourceClass = this as any;
    return resources.map((item) => new ResourceClass(item).toArray());
  }
}
