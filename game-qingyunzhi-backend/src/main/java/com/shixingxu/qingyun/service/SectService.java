package com.shixingxu.qingyun.service;

import com.shixingxu.qingyun.entity.Sect;

import java.util.List;

public interface SectService {

    /** 获取所有上线门派，按 sort 升序 */
    List<Sect> listOnline();
}
