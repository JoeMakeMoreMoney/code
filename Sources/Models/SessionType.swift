import Foundation

enum SessionType: String, CaseIterable {
    case work = "工作"
    case shortBreak = "短休息"
    case longBreak = "长休息"

    var defaultDuration: Int {
        switch self {
        case .work: return 25 * 60
        case .shortBreak: return 5 * 60
        case .longBreak: return 15 * 60
        }
    }

    var color: String {
        switch self {
        case .work: return "#E74C3C"
        case .shortBreak: return "#27AE60"
        case .longBreak: return "#3498DB"
        }
    }
}
