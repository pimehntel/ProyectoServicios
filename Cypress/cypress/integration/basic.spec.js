describe('Prueba local', () => {

    it('Test', () => {
        cy.visit('http://192.168.1.77:8010/')
        cy.get('#mat-input-0').clear().type('admin')
        cy.get('.mat-raised-button').click()
        cy.get('h1').should('contain','About')
    });

});