const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()


module.exports = {

    // View Home
    async getHome(req, res) {
        var sucesso_login
        var warning
        var profilePic 
        var userType
        var userName
        
        if (req.session.warning) {
            warning = req.session.warning
            req.session.warning = ""
        }

        if (req.session.loggedin == true) {
            var userId = req.session.userId
            // console.log(userId)

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            profilePic = findUserById.profilePic
            userType = findUserById.type
            userName = findUserById.name
            

            if (req.session.sucesso_login) {
                sucesso_login = req.session.sucesso_login
                req.session.sucesso_login = ""
            }


            res.render('home', { profilePic: profilePic, userType: userType, userName: userName, sucesso_login: sucesso_login, warning: warning })
        } else {
            res.render('home', { userType: userType, profilePic: profilePic, userName: userName, sucesso_login: sucesso_login, warning: warning })
        }
    }
}