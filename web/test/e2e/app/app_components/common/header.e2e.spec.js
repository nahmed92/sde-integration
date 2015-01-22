describe('Header', function() {

  beforeEach(function() {
    browser.driver.manage().window().maximize();
    browser.get('/');
  });

  it('should show service name', function() {
    expect(element(by.css('a[class="navbar-brand"]')).getText()).toBe('Report Service');
  });

  it('should show menu item', function() {
    expect(element(by.css('ul[class="nav navbar-nav"] li a')).getText()).toBe('SDE');
  });

});
