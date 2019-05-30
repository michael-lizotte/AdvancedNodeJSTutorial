const keys = require('../config/keys')

require('../models/User')
require('../models/Blog')
require('../services/mongoose')(keys)