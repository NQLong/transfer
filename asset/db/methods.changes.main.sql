CREATE OR REPLACE FUNCTION TC_DINH_MUC_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                filter IN STRING, searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    TC_INFO            SYS_REFCURSOR;
    namHoc             STRING(11);
    hocKy              STRING(4);
    listBacDaoTao      STRING(20);
    listLoaiHinhDaoTao STRING(50);
    listLoaiPhi        STRING(40);
    sT                 STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN

    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiPhi') INTO listLoaiPhi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_DINH_MUC_HOC_PHI TCDM
             LEFT JOIN TC_LOAI_PHI TCLP ON TCLP.ID = TCDM.LOAI_PHI
             LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = TCDM.LOAI_DAO_TAO
             LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = TCDM.BAC_DAO_TAO
             LEFT JOIN DM_HOC_SDH DHS ON DHS.MA = TCDM.MA
    WHERE (searchTerm = '' OR lower(TCLP.TEN) LIKE sT)
      AND (namHoc IS NOT NULL AND TCDM.NAM_HOC = namHoc OR namHoc IS NULL)
      AND (hocKy IS NOT NULL AND TCDM.HOC_KY = hocKy OR hocKy IS NULL)
      AND (listBacDaoTao IS NULL OR
           listBacDaoTao IS NOT NULL AND
           TCDM.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                from dual
                                connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
      AND (listLoaiPhi IS NULL OR
           listLoaiPhi IS NOT NULL AND
           TCDM.LOAI_PHI IN (SELECT regexp_substr(listLoaiPhi, '[^,]+', 1, level)
                             from dual
                             connect by regexp_substr(listLoaiPhi, '[^,]+', 1, level) is not null))
      AND (listLoaiHinhDaoTao IS NULL OR
           listLoaiHinhDaoTao IS NOT NULL AND
           TCDM.LOAI_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                 from dual
                                 connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null));

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN TC_INFO FOR
        SELECT *
        FROM (SELECT TCDM.HOC_KY           AS                  "hocKy",
                     TCDM.LOAI_PHI         AS                  "loaiPhi",
                     TCLP.TEN              AS                  "tenLoaiPhi",
                     TCDM.NAM_HOC          AS                  "namBatDau",
                     TCDM.NAM_KET_THUC     AS                  "namKetThuc",
                     BDT.TEN_BAC           AS                  "tenBacDaoTao",
                     BDT.MA_BAC            AS                  "bacDaoTao",
                     LHDT.MA               AS                  "heDaoTaoDh",
                     DHS.MA                AS                  "heDaoTaoSdh",
                     LHDT.TEN              AS                  "tenHeDh",
                     DHS.TEN               AS                  "tenHeSdh",
                     TCDM.SO_TIEN_MAC_DINH AS                  "soTienMacDinh",
                     ROW_NUMBER() OVER (ORDER BY TCDM.NAM_HOC) R
              FROM TC_DINH_MUC_HOC_PHI TCDM
                       LEFT JOIN TC_LOAI_PHI TCLP ON TCLP.ID = TCDM.LOAI_PHI
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = TCDM.LOAI_DAO_TAO
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = TCDM.BAC_DAO_TAO
                       LEFT JOIN DM_HOC_SDH DHS ON DHS.MA = TCDM.MA
              WHERE (searchTerm = '' OR lower(TCLP.TEN) LIKE sT)
                AND (namHoc IS NOT NULL AND TCDM.NAM_HOC = namHoc OR namHoc IS NULL)
                AND (hocKy IS NOT NULL AND TCDM.HOC_KY = hocKy OR hocKy IS NULL)
                AND (listBacDaoTao IS NULL OR
                     listBacDaoTao IS NOT NULL AND
                     TCDM.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                          from dual
                                          connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
                AND (listLoaiPhi IS NULL OR
                     listLoaiPhi IS NOT NULL AND
                     TCDM.LOAI_PHI IN (SELECT regexp_substr(listLoaiPhi, '[^,]+', 1, level)
                                       from dual
                                       connect by regexp_substr(listLoaiPhi, '[^,]+', 1, level) is not null))
                AND (listLoaiHinhDaoTao IS NULL OR
                     listLoaiHinhDaoTao IS NOT NULL AND
                     TCDM.LOAI_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                           from dual
                                           connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
              )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN TC_INFO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_DINH_MUC_HOC_PHI_GET_ITEM_BY(filter IN STRING) RETURN SYS_REFCURSOR
AS
    TC_INFO            SYS_REFCURSOR;
    namHoc             STRING(11);
--     hocKy              STRING(4);
    listBacDaoTao      STRING(20);
    listLoaiHinhDaoTao STRING(50);
    listLoaiPhi        STRING(40);
BEGIN

    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
--     SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiPhi') INTO listLoaiPhi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;

    OPEN TC_INFO FOR
        SELECT
--             TCDM.HOC_KY           AS                  "hocKy",
               TCDM.LOAI_PHI         AS                  "loaiPhi",
               TCLP.TEN              AS                  "tenLoaiPhi",
               TCDM.NAM_HOC          AS                  "namHoc",
               BDT.TEN_BAC           AS                  "tenBacDaoTao",
               TCDM.BAC_DAO_TAO      AS                  "bacDaoTao",
               LHDT.MA               AS                  "heDaoTaoDh",
               DHS.MA                AS                  "heDaoTaoSdh",
               LHDT.TEN              AS                  "tenHeDh",
               DHS.TEN               AS                  "tenHeSdh",
               TCDM.SO_TIEN          AS                  "soTien"
        FROM TC_DINH_MUC_HOC_PHI TCDM
                 LEFT JOIN TC_LOAI_PHI TCLP ON TCLP.ID = TCDM.LOAI_PHI
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = TCDM.LOAI_DAO_TAO
                 LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = TCDM.BAC_DAO_TAO
                 LEFT JOIN DM_HOC_SDH DHS ON DHS.MA = TCDM.LOAI_DAO_TAO
        WHERE TCDM.NAM_HOC = namHoc
--           AND TCDM.HOC_KY = hocKy
          AND (listBacDaoTao IS NULL OR
               listBacDaoTao IS NOT NULL AND
               TCDM.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                    from dual
                                    connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
          AND (listLoaiPhi IS NULL OR
               listLoaiPhi IS NOT NULL AND
               TCDM.LOAI_PHI IN (SELECT regexp_substr(listLoaiPhi, '[^,]+', 1, level)
                                 from dual
                                 connect by regexp_substr(listLoaiPhi, '[^,]+', 1, level) is not null))
          AND (listLoaiHinhDaoTao IS NULL OR
               listLoaiHinhDaoTao IS NOT NULL AND
               TCDM.LOAI_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                     from dual
                                     connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null));
    RETURN TC_INFO;
END;

/
--EndMethod--

