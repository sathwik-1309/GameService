import redisClient from './utils/redisClient'

const func = async() => {
  const user_ids = await redisClient.sMembers(`game:bd8b7b15-4436-48ee-b5e8-6eaa0490926c:users`)
  console.log(user_ids)
}

const func2 = async(user_id: Number) => {
  const isMember = await redisClient.sIsMember(`game:bd8b7b15-4436-48ee-b5e8-6eaa0490926c:users`, String(user_id))
  console.log(isMember)
}

func2(2)
