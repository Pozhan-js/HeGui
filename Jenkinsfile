pipeline {
  agent any
  environment {
    def SERVICE_NAME = 'platform-ui'
    def NAMESPACE = 'dev'
    def REPO = "${GENERIC_REPO_NAME}"
  }
    stages {
        stage('初始化') {
          steps {
            script {
              if(env.BRANCH_NAME == 'develop') {
                REPO = env.GENERIC_REPO_NAME
              }
              if(env.BRANCH_NAME == 'uat' || env.BRANCH_NAME == '1.0.0' || env.BRANCH_NAME == 'hotfix') {
                REPO = env.GENERIC_REPO_NAME
                NAMESPACE = 'uat'
              }
              if(env.BRANCH_NAME == 'master') {
                REPO = env.GENERIC_REPO_NAME_PROD
                NAMESPACE = 'prod'
              }
            }
          }
        }
        stage('检出') {
          steps {
            checkout([
              $class: 'GitSCM',
              branches: [[name: GIT_BUILD_REF]],
              userRemoteConfigs: [[
                url: GIT_REPO_URL,
                credentialsId: CREDENTIALS_ID
              ]]])
            }
          }
      stage('安装依赖') {
        steps {
          sh 'npm i'
        }
      }
      stage('打包') {
        steps {
          sh "npm run build:${NAMESPACE}"
        }
      }
      stage(' 上传到 test generic 仓库') {
        steps {
          codingArtifactsGeneric(files: 'dist/**', repoName: "${REPO}", zip: 'dist.zip')
        }
      }
    }
}
