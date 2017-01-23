export class ViewControllerMock {
  get readReady() {
    return {
      subscribe: (fn) => {
        setTimeout(fn, 100);

        return {
          unsubscribe: () => {

          }
        };
      }
    };
  }

  get writeReady() {
    return {
      subscribe: (fn) => {
        setTimeout(fn, 100);

        return {
          unsubscribe: () => {

          }
        };
      }
    };
  }

  public _setHeader(): any {
    return {};
  }

  public _setIONContent(): any {
    return {};
  }

  public _setIONContentRef(): any {
    return {};
  }
}
