// Linked List Node class
export class TestimonialNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

// Circular Linked List for testimonials
export class TestimonialLinkedList {
  constructor() {
    this.head = null;
    this.current = null;
  }

  add(testimonial) {
    const newNode = new TestimonialNode(testimonial);

    if (!this.head) {
      this.head = newNode;
      this.current = newNode;
      newNode.next = newNode; // Point to itself for circular list
    } else {
      // Find the last node
      let temp = this.head;
      while (temp.next !== this.head) {
        temp = temp.next;
      }
      // Add new node and maintain circular structure
      temp.next = newNode;
      newNode.next = this.head;
    }
  }

  getCurrent() {
    return this.current ? this.current.data : null;
  }

  moveToNext() {
    if (this.current) {
      this.current = this.current.next;
    }
  }

  moveToPrevious() {
    if (this.current && this.head) {
      // Find the previous node in circular list
      let temp = this.current;
      while (temp.next !== this.current) {
        temp = temp.next;
      }
      this.current = temp;
    }
  }

  moveToIndex(index) {
    if (!this.head) return;

    this.current = this.head;
    for (let i = 0; i < index; i++) {
      this.current = this.current.next;
    }
  }

  getCurrentIndex() {
    if (!this.head || !this.current) return 0;

    let index = 0;
    let temp = this.head;
    while (temp !== this.current) {
      temp = temp.next;
      index++;
      // Safety check to avoid infinite loop
      if (temp === this.head && index > 0) break;
    }
    return index;
  }

  getSize() {
    if (!this.head) return 0;

    let count = 1;
    let temp = this.head;
    while (temp.next !== this.head) {
      temp = temp.next;
      count++;
    }
    return count;
  }

  getAllTestimonials() {
    const testimonials = [];
    if (!this.head) return testimonials;

    let temp = this.head;
    do {
      testimonials.push(temp.data);
      temp = temp.next;
    } while (temp !== this.head);

    return testimonials;
  }
}
