/* eslint-disable no-undef */
describe('React Node Template', function () {
  it('Front page can be opened', function () {
    cy.visit('/')
    cy.contains('React Node Template')
    cy.contains('containerized edition')
  })
  it('Navbar can be used to navigate', function () {
    cy.visit('/')
    cy.get('#firstOption').click()
    cy.contains('First Option')
  })
})