export class Deck {
  private cards: string[];

  constructor(numDecks: number = 1) {
    this.cards = this.generateDeck(numDecks);
    this.shuffle();
  }

  private generateDeck(numDecks: number): string[] {
    const suits = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck: string[] = [];

    for (let i = 0; i < numDecks; i++) {
      for (const suit of suits) {
        for (const value of values) {
          deck.push(`${value} ${suit}`);
        }
      }
    }

    return deck;
  }

  private shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public dealCards(numCards: number, playerIds: string[]): Record<string, string[]> {
    const playerCards: Record<string, string[]> = {};

    for (let i = 0; i < playerIds.length; i++) {
      playerCards[playerIds[i]] = this.cards.splice(0, numCards);
    }

    return playerCards;
  }

  public getRemainingCards(): string[] {
    return this.cards;
  }
}