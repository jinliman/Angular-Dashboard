import { GamechangeTeacherPage } from './app.po';

describe('gamechange-teacher App', () => {
  let page: GamechangeTeacherPage;

  beforeEach(() => {
    page = new GamechangeTeacherPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
