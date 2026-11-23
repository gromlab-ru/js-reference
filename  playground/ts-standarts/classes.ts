// =============================================================================
// Порядок членов класса
//
// Найдите публичную операцию и затем код, от которого она зависит.
// =============================================================================
{
  // Вариант А — публичная операция перед внутренней.
  {
    class Counter {
      private value: number
      constructor(initial: number) { this.value = initial }
      next() { return this.add(1) }
      private add(step: number) { return this.value += step }
    }
  }

  // Вариант Б — внутренняя операция перед публичной.
  {
    class Counter {
      private value: number
      constructor(initial: number) { this.value = initial }
      private add(step: number) { return this.value += step }
      next() { return this.add(1) }
    }
  }
}

// =============================================================================
// Инициализация полей
//
// У обоих счётчиков одно и то же начальное значение и заданный при создании шаг.
// =============================================================================
{
  // Вариант А — все присваивания в конструкторе.
  {
    class Counter {
      value: number
      readonly step: number
      constructor(step: number) {
        this.value = 0
        this.step = step
      }
    }
  }

  // Вариант Б — начальное значение у поля, шаг объявлен параметром-свойством.
  {
    class Counter {
      value = 0
      constructor(readonly step: number) {}
    }
  }
}

// =============================================================================
// Доступ к состоянию
//
// public виден снаружи, protected — наследнику. private проверяет TypeScript,
// а #value остаётся закрытым и после компиляции.
// =============================================================================
{
  // Вариант А
  {
    class Counter {
      public readonly label = 'Попытки'
      protected step = 1
      private value = 0
      next() { return this.value += this.step }
    }
    class PairCounter extends Counter { protected override step = 2 }
    new PairCounter().next() // 2
  }

  // Вариант Б
  {
    class Counter {
      public readonly label = 'Попытки'
      protected step = 1
      #value = 0
      next() { return this.#value += this.step }
    }
    class PairCounter extends Counter { protected override step = 2 }
    new PairCounter().next() // 2
  }
}

// =============================================================================
// Изменяемое поле и readonly
//
// Должен ли вызывающий код иметь возможность заменить номер уже созданного заказа?
// =============================================================================
{
  // Вариант А
  {
    class Order { constructor(public number: string) {} }
    const order = new Order('A-1')
    order.number = 'A-2'
  }

  // Вариант Б
  {
    class Order { constructor(readonly number: string) {} }
    const order = new Order('A-1')
    order.number // 'A-1'; присвоить полю новый номер нельзя.
  }
}

// =============================================================================
// Поле, геттер и метод
//
// После изменения исходной цены поле хранит снимок, геттер и метод пересчитывают сумму.
// =============================================================================
{
  // Вариант А — снимок.
  class ReceiptSnapshot {
    price = 50
    readonly total = this.price * 2
  }
  const snapshot = new ReceiptSnapshot()
  snapshot.price = 60
  snapshot.total // 100

  // Вариант Б — чтение текущей цены.
  class Receipt {
    price = 50
    get total() { return this.price * 2 }
    calculateTotal() { return this.price * 2 }
  }
  const receipt = new Receipt()
  receipt.price = 60
  receipt.total // 120
  receipt.calculateTotal() // 120
}

// =============================================================================
// Метод или стрелочное поле
//
// Передаём операцию в map. В каком месте сохраняется связь с экземпляром?
// =============================================================================
{
  // Вариант А — метод вызывается через экземпляр.
  {
    class Price {
      factor = 2
      convert(amount: number) { return amount * this.factor }
    }
    const price = new Price()
    ;[10, 20].map(amount => price.convert(amount))
  }

  // Вариант Б — стрелку можно передать отдельно.
  {
    class Price {
      factor = 2
      convert = (amount: number) => amount * this.factor
    }
    const price = new Price()
    ;[10, 20].map(price.convert)
  }
}

// =============================================================================
// Конструктор или именованная фабрика
//
// Как понять на месте вызова, в каких единицах передано число?
// =============================================================================
{
  // Вариант А
  {
    class Duration { constructor(readonly ms: number) {} }
    new Duration(2 * 1000)
  }

  // Вариант Б
  {
    class Duration {
      private constructor(readonly ms: number) {}
      static fromSeconds(seconds: number) { return new Duration(seconds * 1000) }
    }
    Duration.fromSeconds(2)
  }
}

// =============================================================================
// Абстрактный класс и интерфейс
//
// Интерфейс задаёт форму операции; базовый класс также может дать общую реализацию.
// =============================================================================
{
  // Вариант А
  interface Label { text(id: number): string }
  class Ticket implements Label {
    text(id: number) { return `№${id}` }
  }

  // Вариант Б
  abstract class NumberedLabel {
    protected abstract prefix: string
    text(id: number) { return `${this.prefix}${id}` }
  }
  class TicketLabel extends NumberedLabel { protected override prefix = '№' }

  new Ticket().text(7) // №7
  new TicketLabel().text(7) // №7
}
