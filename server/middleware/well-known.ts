export default defineEventHandler((event) => {
  if (event.node.req.url?.startsWith('/.well-known')) {
    event.node.res.statusCode = 204
    event.node.res.end()
  }
})
