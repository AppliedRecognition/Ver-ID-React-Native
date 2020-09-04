require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "appliedrec-react-native-plugin-ver-id"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "10.3" }
  s.swift_version = '5.0'
  s.source       = { :git => "https://github.com/jonathanmatusqxdev/appliedrec-react-native-plugin-ver-id.git", :tag => "#{s.version}" }


  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.dependency "Ver-ID-UI", "1.12.4"
  s.dependency "Ver-ID-SDK-Identity", "3.0.1"

  s.dependency "React"
end
