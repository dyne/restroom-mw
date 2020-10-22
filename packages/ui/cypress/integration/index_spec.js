describe("The Swagger UI", () => {
  it("successfully loads", () => {
    cy.visit("http://localhost/docs");
  });
});
