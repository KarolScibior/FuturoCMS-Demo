const graphql = (query, variables = {}) => {
  return fetch('/admin/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      variables,
      query,
    }),
  }).then(function (result) {
    return result.json()
  })
}

const GET_CATEGORIES = `
    query GetCategories {
      allCategories {
        id,
        name,
        image {
          publicUrl
        },
        products {
          name,
          image {
            publicUrl
          },
          pdf {
            publicUrl
          }
          xlsx {
            publicUrl
          }
        }
      }
    }
  `

const createCategory = category => {
  const { id, name, image, products } = category
  const { publicUrl } = image

  const categoryImage = document.createElement('img')
  categoryImage.src = publicUrl

  const categoryName = document.createElement('span')
  categoryName.innerText = name

  const productsContainer = document.createElement('div')
  productsContainer.classList.add('products-container')

  products.forEach(product => {
    const { image: pImage, name: pName, pdf, xlsx } = product
    const { publicUrl: pPublicUrl } = pImage
    const productContainer = document.createElement('div')

    const productImage = document.createElement('img')
    productImage.src = pPublicUrl

    const productName = document.createElement('span')
    productName.innerText = pName

    const downloadsContainer = document.createElement('div')
    downloadsContainer.classList.add('downloads')

    const pdfButton = document.createElement('a')
    if (pdf) {
      const { publicUrl: pdfUrl } = pdf
      pdfButton.href = pdfUrl
      pdfButton.download = `${pName}`
    }
    pdfButton.innerText = 'PDF'

    downloadsContainer.append(pdfButton)

    const xlsxButton = document.createElement('a')
    if (xlsx) {
      const { publicUrl: xlsxUrl } = xlsx
      xlsxButton.href = xlsxUrl
      xlsxButton.download = `${pName}`
    }
    xlsxButton.innerText = 'XLSX'

    downloadsContainer.append(xlsxButton)

    productContainer.append(productImage)
    productContainer.append(productName)
    productContainer.append(downloadsContainer)

    productsContainer.append(productContainer)
  })

  const listItem = document.createElement('li')
  listItem.classList.add('list-item')
  listItem.id = id
  listItem.appendChild(categoryImage)
  listItem.appendChild(categoryName)
  listItem.appendChild(productsContainer)

  return listItem
}

const createList = data => {
  const list = document.createElement('ul')
  list.classList.add('list')
  data.allCategories.forEach(category => {
    list.appendChild(createCategory(category))
  })
  return list
}

const createCategoriesList = data => {
  const list = document.createElement('ul')
  list.classList.add('list')
  data.allCategories.forEach(category => {
    const { id, name } = category

    const element = document.createElement('li')

    const link = document.createElement('a')
    link.href = `#${id}`
    link.innerText = name

    element.appendChild(link)

    list.appendChild(element)
  })
  return list
}

const fetchData = () => {
  graphql(GET_CATEGORIES)
    .then(res => {
      document.querySelector('.results').innerHTML = ''
      const offer = createList(res.data)
      document.querySelector('.results').appendChild(offer)

      document.querySelector('.categories-list').innerHTML = ''
      const categoriesList = createCategoriesList(res.data)
      document.querySelector('.categories-list').appendChild(categoriesList)
    })
    .catch(err => {
      console.log(err)
      document.querySelector('.results').innerHTML = '<p>Error</p>'
    })
}

document.getElementById('app').parentNode.innerHTML = `
<div class="sidebar">
  <div>
    <h2 class="app-heading">Wyszukaj</h2>
    <input />
    <div class="categories-list"></div>
  </div>
</div>
<div class="app">
  <h1 class="main-heading">Demo dla Futuro CMS</h1>
  <p class="intro-text">
    Aby przejść do cmsa kliknij <a href="/admin">tutaj</a>
  </p>
  <hr class="divider" />
  <div class="demo-wrapper">
    <h2 class="app-heading">Oferta</h2>
    <div class="results">
      <p>Loading...</p>
    </div>
  </div>
</div>`

fetchData()
